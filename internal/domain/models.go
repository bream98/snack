package domain

import (
	"gorm.io/gorm"
)

// User represents a user account stored in PostgreSQL
type User struct {
	gorm.Model
	Phone        string `gorm:"uniqueIndex;type:varchar(16);not null" json:"phone"`
	DisplayName  string `gorm:"type:varchar(64);not null" json:"display_name"`
	HashPassword string `gorm:"type:varchar(255);not null" json:"-"`
}

type DirectChannel struct {
	gorm.Model
	UserId1 uint `gorm:"index:idx_user1_user2;not null" json:"user_id_1"`
	User1   User `gorm:"foreignKey:UserId1" json:"user_1,omitempty"`
	UserId2 uint `gorm:"index:idx_user1_user2;not null" json:"user_id_2"`
	User2   User `gorm:"foreignKey:UserId2" json:"user_2,omitempty"`
}

type Message struct {
	gorm.Model
	ChannelId uint          `gorm:"index:idx_channel_id;not null" json:"channel_id"`
	Channel   DirectChannel `json:"channel,omitempty"`
	UserId    uint          `gorm:"index:idx_user_id;not null" json:"user_id"`
	User      User          `gorm:"foreignKey:UserId" json:"user,omitempty"`
	Value     string        `gorm:"type:varchar(255);not null" json:"value"`
}

type DirectMember struct {
	gorm.Model
	ChannelId uint          `gorm:"index:idx_channel_id;not null" json:"channel_id"`
	Channel   DirectChannel `json:"channel,omitempty"`
	UserId    uint          `gorm:"uniqueIndex;index:idx_user_id;not null" json:"user_id"`
}
