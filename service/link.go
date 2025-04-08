package service

import (
	"errors"
	"grlink/database"
	"grlink/model"
	"grlink/utils"

	"github.com/google/uuid"
)

func GetAllLinks() []model.Link {
	var links []model.Link
	if err := database.DB.Find(&links).Error; err != nil {
		utils.SugarLogger.Errorf("Error getting links: %v", err)
		return nil
	}
	for i, link := range links {
		links[i].User, _ = GetUser(link.UserID)
		links[i].Statistics = GetStatisticsForLink(link.ID)
	}
	return links
}

func GetLinkByID(id string) model.Link {
	var link model.Link
	if err := database.DB.Where("id = ?", id).First(&link).Error; err != nil {
		utils.SugarLogger.Errorf("Error getting link with id: %s, error: %v", id, err)
		return model.Link{}
	}
	link.User, _ = GetUser(link.UserID)
	link.Statistics = GetStatisticsForLink(link.ID)
	return link
}

func GetLinkByShortCode(shortCode string) model.Link {
	var link model.Link
	if err := database.DB.Where("short_code = ?", shortCode).First(&link).Error; err != nil {
		utils.SugarLogger.Errorf("Error getting link with short code: %s, error: %v", shortCode, err)
		return model.Link{}
	}
	link.User, _ = GetUser(link.UserID)
	link.Statistics = GetStatisticsForLink(link.ID)
	return link
}

func CreateLink(link model.Link, userID string) (model.Link, error) {
	if link.ID == "" {
		// new link
		link.ID = uuid.New().String()
		// if custom short code is provided, check if it is already taken
		if link.ShortCode != "" {
			if GetLinkByShortCode(link.ShortCode).ID != "" {
				return model.Link{}, errors.New("custom short code already taken")
			}
		}
	}
	if link.ShortCode == "" {
		link.ShortCode = uuid.New().String()[:6]
		for GetLinkByShortCode(link.ShortCode).ID != "" {
			link.ShortCode = uuid.New().String()[:6]
		}
	}
	if link.OriginalURL == "" {
		return model.Link{}, errors.New("link target url is required")
	}

	existingLink := GetLinkByID(link.ID)
	if existingLink.ID != "" {
		if existingLink.UserID != userID {
			// check if user is admin
			user, err := GetUser(userID)
			if err != nil {
				return model.Link{}, errors.New("you are not allowed to update this link")
			}
			if !user.IsInnerCircle() {
				return model.Link{}, errors.New("you are not allowed to update this link")
			}
		}
	} else {
		link.UserID = userID
	}

	link.ExpiresAt = utils.WithPrecision(link.ExpiresAt)

	if database.DB.Where("id = ?", link.ID).Select("*").Updates(&link).RowsAffected == 0 {
		utils.SugarLogger.Infof("New link created with id: %s", link.ID)
		if result := database.DB.Create(&link); result.Error != nil {
			return model.Link{}, result.Error
		}
	} else {
		utils.SugarLogger.Infof("Link with id: %s has been updated!", link.ID)
	}
	return link, nil
}

func DeleteLink(id string) error {
	if result := database.DB.Delete(&model.Link{}, id); result.Error != nil {
		return result.Error
	}
	return nil
}

func GetStatisticsForLink(linkID string) model.LinkStatistics {
	var statistics model.LinkStatistics
	statistics.LinkID = linkID
	statistics.Visits = GetAllVisitsForLink(linkID)
	statistics.TotalVisits = len(statistics.Visits)
	if statistics.TotalVisits > 0 {
		statistics.LastVisit = statistics.Visits[0].CreatedAt
	}
	return statistics
}

func GetAllVisitsForLink(linkID string) []model.LinkVisit {
	var visits []model.LinkVisit
	if err := database.DB.Where("link_id = ?", linkID).Order("created_at DESC").Find(&visits).Error; err != nil {
		utils.SugarLogger.Errorf("Error getting visits for link with id: %s, error: %v", linkID, err)
		return nil
	}
	return visits
}

func GetVisitByID(id string) model.LinkVisit {
	var visit model.LinkVisit
	if err := database.DB.Where("id = ?", id).First(&visit).Error; err != nil {
		utils.SugarLogger.Errorf("Error getting visit with id: %s, error: %v", id, err)
		return model.LinkVisit{}
	}
	return visit
}

func CreateVisit(visit model.LinkVisit) (model.LinkVisit, error) {
	if result := database.DB.Create(&visit); result.Error != nil {
		return model.LinkVisit{}, result.Error
	}
	return visit, nil
}