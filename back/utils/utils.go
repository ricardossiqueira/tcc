package utils

import (
	"archive/tar"
	"bytes"
)

func ScriptToTar(buf *bytes.Buffer, script string) error {
	tw := tar.NewWriter(buf)
	var files = []struct {
		Name, Body string
	}{
		{"app.py", script},
	}

	for _, file := range files {
		hdr := &tar.Header{
			Name: file.Name,
			Mode: 0600,
			Size: int64(len(file.Body)),
		}
		if err := tw.WriteHeader(hdr); err != nil {
			return err
		}
		if _, err := tw.Write([]byte(file.Body)); err != nil {
			return err
		}
	}
	if err := tw.Close(); err != nil {
		return err
	}
	return nil
}
