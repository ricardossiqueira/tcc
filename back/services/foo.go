package services

// import (
// 	"context"
// 	"fmt"
// 	"github.com/docker/docker/api/types"
// 	"github.com/docker/docker/client"
// 	"github.com/docker/docker/api/types/container"
// )

// func main() {
// 	// Replace these values with your desired container and port configurations
// 	imageName := "nginx:latest" // Docker image to use
// 	containerPort := "80"       // Port to be exposed inside the container
// 	hostPort := "8080"           // Port to be exposed on the host
// 	hostIP := "0.0.0.0"          // Host IP address to bind the port

// 	// Create a new Docker client
// 	cli, err := client.NewEnvClient()
// 	if err != nil {
// 		panic(err)
// 	}

// 	// Pull the Docker image
// 	fmt.Printf("Pulling image %s...\n", imageName)
// 	reader, err := cli.ImagePull(context.Background(), imageName, types.ImagePullOptions{})
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer reader.Close()

// 	// Wait for the image to be pulled
// 	// Note: You may want to add a timeout or use a more sophisticated method in a production environment
// 	_, err = cli.ImageInspectWithRaw(context.Background(), imageName)
// 	if err != nil {
// 		panic(err)
// 	}
// 	fmt.Printf("Image %s pulled successfully!\n", imageName)

// 	// Create container configuration
// 	config := &container.Config{
// 		Image: imageName,
// 		ExposedPorts: map[nat.Port]struct{}{
// 			nat.Port(containerPort + "/tcp"): {},
// 		},
// 	}

// 	// Set port binding
// 	hostBinding := nat.PortBinding{
// 		HostIP:   hostIP,
// 		HostPort: hostPort,
// 	}

// 	containerPortBinding := nat.PortMap{
// 		nat.Port(containerPort + "/tcp"): []nat.PortBinding{hostBinding},
// 	}

// 	// Create host configuration
// 	hostConfig := &container.HostConfig{
// 		PortBindings: containerPortBinding,
// 	}

// 	// Create the container
// 	fmt.Println("Creating container...")
// 	resp, err := cli.ContainerCreate(
// 		context.Background(),
// 		config,
// 		hostConfig,
// 		nil,
// 		nil,
// 		"")
// 	if err != nil {
// 		panic(err)
// 	}

// 	// Start the container
// 	fmt.Println("Starting container...")
// 	if err := cli.ContainerStart(context.Background(), resp.ID, types.ContainerStartOptions{}); err != nil {
// 		panic(err)
// 	}

// 	fmt.Printf("Container %s started successfully!\n", resp.ID)

// 	// Cleanup: Stop and remove the container after running
// 	defer func() {
// 		fmt.Printf("Stopping container %s...\n", resp.ID)
// 		if err := cli.ContainerStop(context.Background(), resp.ID, nil); err != nil {
// 			panic(err)
// 		}

// 		fmt.Printf("Removing container %s...\n", resp.ID)
// 		if err := cli.ContainerRemove(context.Background(), resp.ID, types.ContainerRemoveOptions{}); err != nil {
// 			panic(err)
// 		}
// 		fmt.Printf("Container %s removed successfully!\n", resp.ID)
// 	}()
// }
