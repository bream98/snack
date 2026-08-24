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
	defer db.Exec("SELECT pg_advisory_unlock(999999)")

	// Auto migrate schema
	err = db.AutoMigrate(
		&domain.User{},
		&domain.DirectChannel{},
		&domain.DirectMember{},
		&domain.Message{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
