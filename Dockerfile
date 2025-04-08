FROM --platform=$BUILDPLATFORM golang:1.23-alpine3.20 AS builder

RUN apk --no-cache add ca-certificates
RUN apk add --no-cache tzdata

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./
ARG TARGETOS
ARG TARGETARCH
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /grlink

##
## Deploy
##
FROM alpine:3.20

WORKDIR /

COPY --from=builder /grlink /grlink

COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ=America/Los_Angeles

ENTRYPOINT ["/grlink"]