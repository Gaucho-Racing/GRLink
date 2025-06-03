package api

import (
	"grlink/config"
	"grlink/model"
	"grlink/service"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// getDeviceType determines the operating system from the user agent string
func getDeviceType(userAgent string) string {
	userAgent = strings.ToLower(userAgent)
	
	// Check for iOS devices
	if strings.Contains(userAgent, "iphone") || 
		strings.Contains(userAgent, "ipad") || 
		strings.Contains(userAgent, "ipod") {
		return "iOS"
	}
	
	// Check for Android devices
	if strings.Contains(userAgent, "android") {
		return "Android"
	}
	
	// Check for Windows
	if strings.Contains(userAgent, "windows") {
		return "Windows"
	}
	
	// Check for MacOS - looking for both newer "macOS" and older "mac os x" strings
	if strings.Contains(userAgent, "mac os") || 
		strings.Contains(userAgent, "macos") {
		return "MacOS"
	}
	
	// Default to Other for all other cases
	return "Other"
}

func GetAllLinks(c *gin.Context) {
	links := service.GetAllLinks()
	c.JSON(http.StatusOK, links)
}

func GetLinkByID(c *gin.Context) {
	id := c.Param("id")
	link := service.GetLinkByID(id)
	if link.ID == "" {
		// try to get link by short code
		link = service.GetLinkByShortCode(id)
		if link.ID == "" {
			c.JSON(http.StatusNotFound, gin.H{"message": "Link with id: " + id + " not found!"})
			return
		}
	}
	c.JSON(http.StatusOK, link)
}

func CreateLink(c *gin.Context) {
	var link model.Link
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	link, err := service.CreateLink(link, GetRequestUserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, link)
}

func DeleteLink(c *gin.Context) {
	id := c.Param("id")
	err := service.DeleteLink(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Link with id: " + id + " deleted!"})
}

func LaunchLink(c *gin.Context) {
	frontendURL := strings.Split(config.Sentinel.RedirectURI, "/auth/login")[0]
	shortCode := c.Param("shortCode")
	link := service.GetLinkByShortCode(shortCode)
	if link.ID == "" {
		// try to get link by id
		link = service.GetLinkByID(shortCode)
		if link.ID == "" {
			message := url.QueryEscape("Link with short code: " + shortCode + " not found!")
			c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/error?message=" + message)
			return
		}
	}
	if !link.IsActive {
		message := url.QueryEscape("Link with short code: " + shortCode + " is not active!")
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/error?message=" + message)
		return
	}
	visit := model.LinkVisit{
		ID:        uuid.New().String(),
		LinkID:    link.ID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
		Referer:    c.Request.Referer(),
		Country:    c.Request.Header.Get("CF-IPCountry"),
		DeviceType: getDeviceType(c.Request.UserAgent()),
	}
	service.CreateVisit(visit)

	c.Redirect(http.StatusTemporaryRedirect, link.OriginalURL)
}