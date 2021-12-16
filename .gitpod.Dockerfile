FROM gitpod/workspace-full:latest
SHELL ["/bin/bash", "-c"]

# Install nvm
RUN .nvm/nvm.sh
# Lock node version
RUN <<EOR
    nvm install 12
    nvm use 12
    nvm alias default 12
EOR
RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
# Login to npm
RUN <<EOR
    if [[ ! -z "${NPM_TOKEN}" ]]; then
        printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" >> /home/gitpod/.npmrc
    fi
EOR