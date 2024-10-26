package docker

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"log/slog"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/pocketbase/pocketbase"
)

type Config struct {
	image         string
	workingDir    string
	containerPort string
	exposedPort   string ""
	cmd           []string
}

var containerConfig = Config{
	image:         "devilbox/python-flask:3.8-dev",
	workingDir:    "/python-docker",
	containerPort: "5000",
	cmd:           []string{"python3", "-m", "flask", "run", "--host=0.0.0.0"},
}

// Handle container creation steps, here you must set the port will be allocated
// to the container in the moment of the creation. THIS CAN NOT BE CHANGED BY
// THE CONTAINER START FUNCTION!
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
	app.Logger().Log(context.Background(), slog.LevelDebug, fmt.Sprintf("Container created: %s\n", resp.ID))

	dockerCli.CopyToContainer(
		dockerCtx,
		resp.ID,
		containerConfig.workingDir,
		bufio.NewReader(&tar),
		container.CopyToContainerOptions{AllowOverwriteDirWithFile: true},
	)
	app.Logger().Log(context.Background(), slog.LevelDebug, fmt.Sprintf("Files copied to container: %s\n", resp.ID))

	return resp, nil
}

func GetImage() string {
	return containerConfig.image
}
