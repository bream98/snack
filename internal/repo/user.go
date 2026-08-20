package repo

import (
	"snack/internal/domain"

	"gorm.io/gorm"
)

type UserRepo struct {
	Db *gorm.DB
}

func (r *UserRepo) WithTransaction(fn func(tx *gorm.DB) error) error {
	return r.Db.Transaction(fn)
}

func (r *UserRepo) GetUserById(id uint) (*domain.User, error) {
	user := &domain.User{}
	user.ID = id
	err := r.Db.Find(user).Error
	return user, err
}

func (r *UserRepo) Save(user *domain.User) error {
	return r.Db.Save(user).Error
}

func (r *UserRepo) FindByConditions(user *domain.User) ([]*domain.User, error) {
	return nil, nil
}

func (r *UserRepo) FindByPhone(phone string) (*domain.User, error) {
	user := &domain.User{}
	err := r.Db.Where("phone = ?", phone).First(user).Error
	return user, err
}
