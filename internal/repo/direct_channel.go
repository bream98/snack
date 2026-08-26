package repo

import (
	"errors"
	"snack/internal/domain"

	"gorm.io/gorm"
)

type DirectChannelRepo struct {
	Db *gorm.DB
}

func (r *DirectChannelRepo) Save(dc *domain.DirectChannel) (*domain.DirectChannel, error) {
	id1, id2 := r.sortPairKey(dc.UserId1, dc.UserId2)
	dc.UserId1 = id1
	dc.UserId2 = id2
	err := r.Db.Where(domain.DirectChannel{UserId1: id1, UserId2: id2}).FirstOrCreate(dc).Error
	return dc, err
}

func (r *DirectChannelRepo) CreateMessage(msg *domain.Message) (*domain.Message, error) {
	err := r.Db.Create(msg).Error
	return msg, err
}

func (r *DirectChannelRepo) sortPairKey(id1, id2 uint) (id1Key, id2Key uint) {
	if id1 < id2 {
		return id1, id2
	}
	return id2, id1
}

func (r *DirectChannelRepo) GetDirectChannel(id1, id2 uint) (*domain.DirectChannel, error) {
	dc := &domain.DirectChannel{}
	err := r.Db.Preload("User1").Preload("User2").
		Where(domain.DirectChannel{UserId1: id1, UserId2: id2}).First(dc).Error
	return dc, err
}

func (r *DirectChannelRepo) GetDirectChannelByUserId(userId uint) ([]*domain.DirectChannel, error) {
	var channels []*domain.DirectChannel
	err := r.Db.Preload("User1").Preload("User2").
		Where("user_id1 = ? OR user_id2 = ?", userId, userId).
		Order("updated_at DESC").
		Find(&channels).Error
	return channels, err
}

func (r *DirectChannelRepo) GetDirectMessages(userId uint, channelId uint, fromMsgId *uint) ([]*domain.Message, error) {
	var channel domain.DirectChannel
	err := r.Db.Where("id = ? AND (user_id1 = ? OR user_id2 = ?)", channelId, userId, userId).First(&channel).Error
	if err != nil {
		return nil, errors.New("not found direct channel")
	}

	var messages []*domain.Message
	limit := 20
	query := r.Db.Preload("User").Where("channel_id = ?", channelId)

	if fromMsgId != nil && *fromMsgId > 0 {
		query = query.Where("id < ?", *fromMsgId)
	}

	err = query.Order("id DESC").Limit(limit).Find(&messages).Error
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (r *DirectChannelRepo) SetLastMsgId(channelId, userId, lastMsgId uint) error {
	directMember := &domain.DirectMember{
		ChannelId: channelId,
		UserId:    userId,
	}

	err := r.Db.First(directMember).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if directMember.ID == 0 {
		directMember.ChannelId = channelId
		directMember.UserId = userId
		return r.Db.Create(directMember).Error
	}

	directMember.LastMessageId = lastMsgId
	return r.Db.Save(directMember).Error
}

func (r *DirectChannelRepo) GetLastMsgId(channelId, userId uint) (uint, error) {
	var directMember domain.DirectMember
	err := r.Db.Where("channel_id = ? AND user_id = ?", channelId, userId).First(&directMember).Error
	if err != nil {
		return 0, err
	}
	return directMember.LastMessageId, nil
}

func (r *DirectChannelRepo) GetAllDirectMemberByUserId(userId uint) ([]*domain.DirectMember, error) {
	var directMembers []*domain.DirectMember
	err := r.Db.Where("user_id = ?", userId).Find(&directMembers).Error
	return directMembers, err
}
