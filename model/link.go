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
	Statistics  LinkStatistics `json:"statistics" gorm:"-"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Link) TableName() string {
	return "link"
}

type LinkStatistics struct {
	LinkID    string `json:"link_id"`
	TotalVisits int `json:"total_visits"`
	LastVisit time.Time `json:"last_visit"`
	Visits    []LinkVisit `json:"visits" gorm:"-"`
}

func (LinkStatistics) TableName() string {
	return "link_statistics"
}

type LinkVisit struct {
	ID        string `json:"id" gorm:"primaryKey"`
	LinkID    string `json:"link_id"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
	Referer   string `json:"referer"`
	Country   string `json:"country"`
	DeviceType string `json:"device_type"`
	CreatedAt time.Time `json:"created_at"`
}

func (LinkVisit) TableName() string {
	return "link_visit"
}
