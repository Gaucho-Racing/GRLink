package model

import "time"

type Link struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	OriginalURL string    `json:"original_url"`
	ShortCode   string    `json:"short_code"`
	UserID      string    `json:"user_id"`
	User        User      `json:"user" gorm:"-"`
	ExpiresAt   time.Time `json:"expires_at"`
	IsActive    bool      `json:"is_active"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Link) TableName() string {
	return "link"
}
