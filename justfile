_default:
    @just --list

@_ask msg:
    bash -c 'read -p "{{msg}} (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1;';

# Download all static mocks for test usage
download-mocks *args:
    node scripts/downloadMocks.js {{args}}

alias dm := download-mocks

# Run test
test mode:
    TEST_MODE={{mode}} node --unhandled-rejections=strict node_modules/.bin/jest \
    --no-cache --runInBand \
    {{ if mode == "unit" { "--testMatch '**/?(*.)+(spec).js'" } else { "" } }}

# Lint all files
lint:
    npm exec eslint -- .

# Format all files
format:
    npm exec eslint -- --fix .
    npm exec prettier -- --write .

gitleaks:
    @echo 'Running GitLeaks...'
    docker run -v {{justfile_directory()}}:/path zricethezav/gitleaks:latest detect --source="/path" --report-path path/gitleaks-report.json

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

    just _ask 'Create verison tag and publish release?';

    new_version=$(npm version patch --sign-git-commit --sign-git-tag);
    git push;
    gh release create $new_version --target main --generate-notes --prerelease;

deps-pr:
    @just _ask 'Create update dependencies pull request?';
    gh pr create --base main --head dependabot --assignee @me --title 'Update dependencies' --body ''

# Delete all untracked files
clean:
    git clean -xdf
