package database

import (
	"fmt"
	"grlink/config"
	"grlink/model"
	"grlink/utils"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitializeDB() error {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		config.DatabaseHost, config.DatabaseUser, config.DatabasePassword, config.DatabaseName, config.DatabasePort)

	var db *gorm.DB
	var err error

	for retries := 0; retries < 5; retries++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

		if err == nil {
			utils.SugarLogger.Infoln("Connected to Postgres database")

			err = db.AutoMigrate(&model.Link{}, &model.LinkStatistics{}, &model.LinkVisit{})
			if err != nil {
				return fmt.Errorf("failed to migrate database: %w", err)
			}

			utils.SugarLogger.Infoln("AutoMigration complete")
			DB = db
			return nil
		}

		utils.SugarLogger.Errorf("failed to connect database, retrying in 5s... (Attempt %d/5)\n", retries+1)
		time.Sleep(time.Second * 5)
	}

	return fmt.Errorf("failed to connect database after 5 attempts: %w", err)
}
