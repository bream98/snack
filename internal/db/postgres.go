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

	// Acquire PostgreSQL Advisory Lock to prevent migration race conditions across multiple nodes
	db.Exec("SELECT pg_advisory_lock(999999)")
	// Drop old single-column unique index if it exists
	_ = db.Migrator().DropIndex(&domain.ChannelMember{}, "idx_channel_members_user_id")
	_ = db.Migrator().DropIndex(&domain.DirectMember{}, "idx_direct_members_user_id")

	// Auto migrate schema
	err = db.AutoMigrate(
		&domain.User{},
		&domain.DirectChannel{},
		&domain.DirectMember{},
		&domain.Message{},
		&domain.Channel{},
		&domain.ChannelMember{},
		&domain.ChannelMessage{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
