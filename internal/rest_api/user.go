package rest_api

import (
	"net/http"
	"snack/internal/repo"

	"github.com/gin-gonic/gin"
)

type userService struct {
	userRepo *repo.UserRepo
}

func (u *userService) GetMe(c *gin.Context) {
	val, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Unauthorized"})
		return
	}
	userId, ok := val.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid user session"})
		return
	}

	user, err := u.userRepo.GetUserById(userId)
	if err != nil || user.ID == 0 {
		c.JSON(http.StatusNotFound, ErrorResponse{Message: "Không tìm thấy người dùng"})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: user})
}

type updateUserRequest struct {
	DisplayName string `json:"display_name" binding:"required,min=2,max=32"`
	Phone       string `json:"phone" binding:"required,min=9,max=15"`
}

func (u *userService) UpdateMe(c *gin.Context) {
	val, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Unauthorized"})
		return
	}
	userId, ok := val.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid user session"})
		return
	}

	body := updateUserRequest{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}

	user, err := u.userRepo.GetUserById(userId)
	if err != nil || user.ID == 0 {
		c.JSON(http.StatusNotFound, ErrorResponse{Message: "Không tìm thấy người dùng"})
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
