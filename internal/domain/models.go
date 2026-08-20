package domain

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user account stored in PostgreSQL
type User struct {
	gorm.Model
	Phone        string `gorm:"uniqueIndex;type:varchar(16);not null"`
	DisplayName  string `gorm:"type:varchar(64);not null"`
	HashPassword string `gorm:"type:varchar(255);not null"`
}

// Channel represents a chat room channel in PostgreSQL
type Channel struct {
	ID          string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Name        string    `gorm:"uniqueIndex;type:varchar(64);not null" json:"name"`
	Description string    `gorm:"type:varchar(255)" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Message represents a chat message stored in PostgreSQL
type Message struct {
	ID         int64     `gorm:"primaryKey;autoIncrement:false" json:"id"` // Snowflake 64-bit ID
	ChannelID  string    `gorm:"index;type:varchar(64)" json:"channel_id"`
	SenderID   string    `gorm:"index;type:varchar(64)" json:"sender_id"`
	SenderName string    `gorm:"type:varchar(64)" json:"sender_name"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	NodeID     string    `gorm:"type:varchar(32)" json:"node_id"`
	CreatedAt  time.Time `gorm:"index" json:"created_at"`
}
