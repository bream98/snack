package api

import (
	"net/http"
	"snack/internal/repo"

	"github.com/gin-gonic/gin"
)

type userService struct {
	userRepo *repo.UserRepo
}

func (u *userService) GetMe(c *gin.Context) {
	userId := c.GetUint("userId")
	user, err := u.userRepo.GetUserById(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: user})
}

type updateUserRequest struct {
	DisplayName string `binding:"required,min=2,max=16"`
	Phone       string `binding:"required,phone"`
}

func (u *userService) UpdateMe(c *gin.Context) {
	userId := c.GetUint("userId")
	body := updateUserRequest{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}

	user, err := u.userRepo.GetUserById(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}
	user.DisplayName = body.DisplayName
	user.Phone = body.Phone
	err = u.userRepo.Save(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: user})
}
