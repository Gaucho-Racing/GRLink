package api

import (
	"grlink/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "GRLink v" + config.Version + " is online!"})
}
