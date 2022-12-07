FROM gitpod/workspace-full:latest

# Use 14 nodejs
RUN bash -c ". .nvm/nvm.sh && nvm install 14 && nvm use 14 && nvm alias default 14"
RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

# Install just
RUN cargo install just

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
RUN echo 'export BUN_INSTALL="/home/gitpod/.bun"' >> /home/gitpod/.bashrc.d/600-bun | bash && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/600-bun | bash