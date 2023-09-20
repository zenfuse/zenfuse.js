_default:
    @echo "\033[1;34m                __                   _     ";
    @echo " _______ _ __  / _|_   _ ___  ___   (_)___ ";
    @echo "|_  / _ \\ '_ \\| |_| | | / __|/ _ \\  | / __|";
    @echo " / /  __/ | | |  _| |_| \\__ \\  __/_ | \\__ \\";
    @echo "/___\\___|_| |_|_|  \\__,_|___/\\___(_)/ |___/";
    @echo "                                  |__/     \033[0m";
    @just --list

# Awaits confirmation from user
@_ask msg:
    bash -c 'read -p "{{msg}} (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1;';

# Prepare repository for contribution
install:
    @echo 'Installing repo dependencies'
    bun install --no-save
    @echo 'Installing web page dependencies'
    cd www && bun install
    @just download-mocks
    @echo
    @echo '(•_•) ( •_•)>⌐■-■ (⌐■_■) Done'

# Download all static mocks for test usage
download-mocks *args:
    node scripts/downloadMocks.js {{args}}

alias dm := download-mocks

jest_command := 'node --unhandled-rejections=strict node_modules/.bin/jest --no-cache --runInBand'

# Run integration tests
test-integration *args:
    @echo '\033[44;1m INTEGRATION TEST \033[0m\n'

    TEST_MODE=integration {{ jest_command }} \
    --testPathIgnorePatterns=bitglobal.test.js {{ args }}

# Run unit tests
test-unit *args:
    @echo '\033[47;1m UNIT TEST \033[0m\n'

    TEST_MODE=unit {{ jest_command }} \
    --testMatch '**/?(*.)+(spec).js' {{ args }}

# Run end2end tests for specific exchange
test-e2e *exchange:
    @echo '\033[41;1m ! \033[43;30m E2E TEST {{ exchange }} \033[41;1m ! \033[0m\n'
    
    TEST_MODE=e2e {{ jest_command }} {{ exchange }}

root := justfile_directory()

# Lint all files
lint *path=root:
    @echo 'Run all linting jobs for {{path}}'
    @just cspell {{path}}
    @just eslint {{path}}

# Run eslint
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
    git add $dictpath;
    git commit -m 'Add {{word}} as ignored word';
    echo Word {{word}} now ignored in cspell;

# Create version tag and push it. Repo workflows will publish new release (only for maintainers)
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

    new_version=$(npm version {{ version }} --no-git-tag-version);
    
    cd www;
    npm version $new_version;
    cd ..;

    git add package.json package-lock.json www/package.json
    git commit -m $new_version
    git tag $new_version

    just _ask 'Push $new_version version tag?';

    git push;
    git push origin $new_version;

# Delete all untracked files
clean:
    git clean -xdf

# Ping exchanges servers
ping:
    node scripts/ping.js
