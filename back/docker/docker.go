package docker

import (
	"bufio"
	"bytes"
	"context"
	"fmt"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/pocketbase/pocketbase"
)

type Config struct {
	image         string   // Docker image name used for container creation.
	workingDir    string   // Working directory inside the container.
	containerPort string   // Port exposed by the container.
	exposedPort   string   "" // Port mapped to the host machine.
	cmd           []string // Command to be executed when the container starts.
}

var containerConfig = Config{
	image:         "devilbox/python-flask:3.8-dev",
	workingDir:    "/python-docker",
	containerPort: "5000",
	cmd:           []string{"python3", "-m", "flask", "run", "--host=0.0.0.0"},
}

// CreateContainer creates a new Docker container, assigns a port, and copies files into it.
//
// Parameters:
//   - app: A pointer to a PocketBase instance, used for logging.
//   - dockerCli: A Docker client instance used to create and manage containers.
//   - dockerCtx: The Docker context used for API interactions.
//   - tar: A bytes buffer containing the files to be copied into the container.
//   - exposedPort: The port on the host machine that will be mapped to the container.
//
// Returns:
//   - container.CreateResponse: A struct containing the container ID and other metadata.
//   - error: An error if the container creation process fails.
//
// Behavior:
// 1. Creates a new Docker container using the predefined configuration (`containerConfig`).
// 2. Maps the container's internal port to the specified exposed host port.
// 3. Copies the provided files (`tar` buffer) into the container's working directory.
// 4. Logs debug messages to indicate successful creation and file copy operations.
//
// Notes:
// - The exposed port is assigned at creation time and **cannot** be changed when starting the container.
func CreateContainer(app *pocketbase.PocketBase, dockerCli *client.Client, dockerCtx context.Context, tar bytes.Buffer, exposedPort string) (container.CreateResponse, error) {
	resp, err := dockerCli.ContainerCreate(dockerCtx, &container.Config{
		Image:        containerConfig.image,
		WorkingDir:   containerConfig.workingDir,
		Cmd:          containerConfig.cmd,
		ExposedPorts: nat.PortSet{nat.Port(containerConfig.containerPort): {}},
	}, &container.HostConfig{
		PortBindings: nat.PortMap{
			nat.Port(containerConfig.containerPort): []nat.PortBinding{
				{HostIP: "", HostPort: string(exposedPort)},
			},
		},
	}, nil, nil, "")
	if err != nil {
		return container.CreateResponse{}, err
	}
	app.Logger().Info(fmt.Sprintf("[CREATE_CONTAINER] Container created: %s", resp.ID))

	dockerCli.CopyToContainer(
		dockerCtx,
		resp.ID,
		containerConfig.workingDir,
		bufio.NewReader(&tar),
		container.CopyToContainerOptions{AllowOverwriteDirWithFile: true},
	)
	app.Logger().Info(fmt.Sprintf("[CREATE_CONTAINER] Files copied to container: %s", resp.ID))

	return resp, nil
}

func GetImage() string {
	return containerConfig.image
}
