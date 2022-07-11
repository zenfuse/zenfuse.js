FROM gitpod/workspace-full:latest

RUN bash -c ". .nvm/nvm.sh && nvm install --latest-npm 14 && nvm use 14 && nvm alias default 14"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
