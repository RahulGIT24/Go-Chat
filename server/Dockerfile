FROM golang:1.17.0-alpine

# Create and set the working directory
RUN mkdir /app
WORKDIR /app

# Add application code
ADD . /app/

# Download dependencies
RUN go mod download

# Build the application
RUN go build -o main ./...


# Specify the command to run the application
CMD ["/app/main"]
