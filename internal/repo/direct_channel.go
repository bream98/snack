package repo

import (
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
