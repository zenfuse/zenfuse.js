_default:
    @just --list

# Awaits confirmation from user
@_ask msg:
    bash -c 'read -p "{{msg}} (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1;';

# Install all npm dependencies including web page
install:
    bun install --no-save
    cd www && bun install

# Download all static mocks for test usage
download-mocks *args:
    node scripts/downloadMocks.js {{args}}

alias dm := download-mocks

# Run test [ unit | integration | e2e ] for npm package
test mode *args:
    TEST_MODE={{mode}} node --unhandled-rejections=strict node_modules/.bin/jest \
    --no-cache --runInBand \
    {{ if mode == "unit" { "--testMatch '**/?(*.)+(spec).js'" } else { "" } }} {{args}}

root := justfile_directory()

# Lint all files
lint *path=root:
    @echo 'Run all linting jobs for {{path}}'
    @just cspell {{path}}
    @just eslint {{path}}

eslint *path=root:
    npm exec eslint -- {{path}}

# Format all files
format *path=root:
    @just eslint --fix {{path}}
    npm exec prettier -- --write {{path}}

# Run GitLeaks docker command
gitleaks *args:
    @echo 'Running GitLeaks...'
    docker run -v {{justfile_directory()}}:/repo zricethezav/gitleaks:latest detect --source="/repo" --report-path repo/gitleaks-report.json {{args}}

# Check files spelling
cspell *path=root:
    @echo 'Running spellcheck...'
    npm exec cspell -- lint {{path}}/** --show-context --no-progress --relative --show-suggestions

# Add word to custom cspell dictionary
ignore-word word:
    #!/usr/bin/env bash
    set -euo pipefail;
    dictpath={{justfile_directory()}}/.cspell-dictionary.txt;
    echo {{word}} >> $dictpath;
    sort -du -o $dictpath $dictpath;
    echo Word {{word}} now ignored in cspell;

# Create patch version release on github
release version:
    #!/usr/bin/env bash
    set -euo pipefail;

    current_branch=$(git rev-parse --abbrev-ref HEAD);

    if [ $current_branch != "main" ]
    then
        echo "Error: should be main branch";
    	exit 1;
    fi

    just _ask 'Create {{ version }} version tag?';
 
    # Commit by myself cuz awaiting this pr to npm https://github.com/npm/cli/pull/5442

    new_version=$(npm version patch --no-git-tag-version);
    
    cd www;
    npm version $new_version;
    cd ..;

    git add package.json package-lock.json www/package.json
    git commit -m $new_version
    git tag $new_version

    just _ask 'Push $new_version version tag?';

    git push;
    git push origin $new_version;

# Creates "Update dependencies" pull request in Github repository
deps-pr:
    @just _ask 'Create update dependencies pull request?';
    gh pr create --base main --head dependabot --assignee @me --title 'Update dependencies' --body ''

# Delete all untracked files
clean:
    git clean -xdf
