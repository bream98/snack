package db

import (
	"time"

	"snack/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB(dsn string) (*gorm.DB, error) {
	config := &gorm.Config{}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Auto migrate schema
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Channel{},
		&domain.Message{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
