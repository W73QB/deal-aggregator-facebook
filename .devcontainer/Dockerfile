# Sử dụng image Universal của Microsoft làm nền (có Node, Python, Git, Zsh)
FROM mcr.microsoft.com/devcontainers/universal:2

# Cài thêm các tiện ích cần thiết cho agent hoặc server
RUN sudo apt-get update && sudo apt-get install -y \
    curl \
    vim \
    jq \
    && sudo apt-get clean -y

# Chỉ định thư mục làm việc
WORKDIR /workspace
