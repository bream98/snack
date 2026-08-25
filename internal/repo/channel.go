package repo

import (
	"snack/internal/domain"

	"gorm.io/gorm"
)

type ChannelRepo struct {
	Db *gorm.DB
}

func (r *ChannelRepo) Create(name string, ownerId uint) (*domain.Channel, error) {
	ch := &domain.Channel{Name: name}
	err := r.Db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ch).Error; err != nil {
			return err
		}
		return tx.Create(&domain.ChannelMember{ChannelId: ch.ID, UserId: ownerId}).Error
	})
	return ch, err
}

func (r *ChannelRepo) GetById(id uint) (*domain.Channel, error) {
	var ch domain.Channel
	err := r.Db.First(&ch, id).Error
	return &ch, err
}

func (r *ChannelRepo) GetByUserId(userId uint) ([]*domain.Channel, error) {
	var channels []*domain.Channel
	err := r.Db.Joins("JOIN channel_members ON channel_members.channel_id = channels.id").
		Where("channel_members.user_id = ? AND channel_members.deleted_at IS NULL", userId).
		Order("channels.updated_at DESC").
		Find(&channels).Error
	return channels, err
}

func (r *ChannelRepo) Delete(id uint) error {
	return r.Db.Delete(&domain.Channel{}, id).Error
}

func (r *ChannelRepo) AddMember(channelId, userId uint) error {
	member := &domain.ChannelMember{ChannelId: channelId, UserId: userId}
	return r.Db.Where(domain.ChannelMember{ChannelId: channelId, UserId: userId}).
		FirstOrCreate(member).Error
}

func (r *ChannelRepo) RemoveMember(channelId, userId uint) error {
	return r.Db.Where("channel_id = ? AND user_id = ?", channelId, userId).
		Delete(&domain.ChannelMember{}).Error
}

func (r *ChannelRepo) GetMembers(channelId uint) ([]*domain.User, error) {
	var users []*domain.User
	err := r.Db.Joins("JOIN channel_members ON channel_members.user_id = users.id").
		Where("channel_members.channel_id = ? AND channel_members.deleted_at IS NULL", channelId).
		Find(&users).Error
	return users, err
}
