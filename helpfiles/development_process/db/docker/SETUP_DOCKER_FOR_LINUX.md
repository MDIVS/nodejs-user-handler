[back to main page](./../../../../README.md)  
[back to devlopment process](./../../DEVELOPMENT_PROCESS.md)

# __Docker setup for linux__

> __(!) Note__  
> Steps referenced at [Docker official page](https://docs.docker.com/engine/install/ubuntu/).

## __Set up the repository__

1. Update the apt package index and install packages to allow apt to use a repository over HTTPS:

    ```
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg
    ```

2. Add Docker’s official GPG key:

    ```
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    ```

3. Use the following command to set up the repository:

    ```
    echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```

    > __(!) Note__  
    > If you use an Ubuntu derivative distro, such as Linux Mint, you may need to use UBUNTU_CODENAME instead of VERSION_CODENAME.

## __Install Docker Engine__
1. Update the apt package index:
    ```
    sudo apt-get update
    ```

2. Install Docker Engine latest version, containerd, and Docker Compose:
    ```
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

3. Verify that the Docker Engine installation is successful by running the hello-world image:
    ```
    sudo docker run hello-world
    ```

## __Known errors__
[How to fix docker: Got permission denied while trying to connect to the Docker daemon socket](https://www.digitalocean.com/community/questions/how-to-fix-docker-got-permission-denied-while-trying-to-connect-to-the-docker-daemon-socket)