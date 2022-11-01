_default:
    @just --list

# Awaits confirmation from user
@_ask msg:
    bash -c 'read -p "{{msg}} (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1;';

# Download all static mocks for test usage
download-mocks *args:
    node scripts/downloadMocks.js {{args}}

alias dm := download-mocks

# Run test [ unit | integration | e2e ]
test mode *args:
    TEST_MODE={{mode}} node --unhandled-rejections=strict node_modules/.bin/jest \
    --no-cache --runInBand \
    {{ if mode == "unit" { "--testMatch '**/?(*.)+(spec).js'" } else { "" } }} {{args}}

# Lint all files
lint: cspell eslint

eslint *args:
    npm exec eslint -- {{justfile_directory()}} {{args}}

# Format all files
format:
    @just eslint --fix
    npm exec prettier -- --write {{justfile_directory()}} 

# Run GitLeaks docker command
gitleaks *args:
    @echo 'Running GitLeaks...'
    docker run -v {{justfile_directory()}}:/repo zricethezav/gitleaks:latest detect --source="/repo" --report-path repo/gitleaks-report.json {{args}}

# Check files spelling
cspell *args:
    npm exec cspell -- lint {{justfile_directory()}}/** --show-context --no-progress --relative --show-suggestions {{args}}

# Add word to custom cspell dictionary
ignore-word word:
    #!/usr/bin/env bash
    set -euo pipefail;
    dictpath={{justfile_directory()}}/.cspell-dictionary.txt;
    echo {{word}} >> $dictpath;
    sort -du -o $dictpath $dictpath;
    echo Word {{word}} now ignored in cspell;

# Create patch version release on github
patch:
    #!/usr/bin/env bash
    set -euo pipefail;

    current_branch=$(git rev-parse --abbrev-ref HEAD);

    if [ $current_branch != "main" ]
    then
        echo "Error: should be main branch";
    	exit 1;
    fi

    just _ask 'Create version tag and publish release?';

    new_version=$(npm version patch --sign-git-commit --sign-git-tag);
    git push;
    gh release create $new_version --target main --generate-notes --prerelease;

# Creates "Update dependencies" pull request in Github repository
deps-pr:
    @just _ask 'Create update dependencies pull request?';
    gh pr create --base main --head dependabot --assignee @me --title 'Update dependencies' --body ''

# Delete all untracked files
clean:
    git clean -xdf
