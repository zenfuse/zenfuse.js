_default:
    @just --list

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

    read -p "Continue? (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 0;

    new_version=$(npm version patch --sign-git-commit --sign-git-tag);
    git push;
    gh release create $new_version --target main --generate-notes --prerelease;

# Delete all untracked files
clean:
	git clean -xdf
