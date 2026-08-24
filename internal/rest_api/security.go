package rest_api

import (
	"net/http"
	"os"
	"snack/internal/domain"
	"snack/internal/repo"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type securityService struct {
	userRepo *repo.UserRepo
}

type loginRequest struct {
	Phone    string `json:"phone" binding:"required,min=9,max=15"`
	Password string `json:"password" binding:"required,min=6,max=32"`
}

type loginResponse struct {
	Token string       `json:"token"`
	User  *domain.User `json:"user"`
}

func (s *securityService) login(c *gin.Context) {
	body := loginRequest{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: err.Error(),
		})
		return
	}

	user, e := s.userRepo.FindByPhone(body.Phone)
	if e != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Message: "Số điện thoại hoặc mật khẩu không chính xác",
		})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(body.Password)) != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Message: "Số điện thoại hoặc mật khẩu không chính xác",
		})
		return
	}

	jwtSecret := getEnv("JWT_SECRET", "secret")
	claims := AuthClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Message: "Không thể khởi tạo mã phiên làm việc",
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: loginResponse{Token: token, User: user}})
}

type registerRequest struct {
	Phone       string `json:"phone" binding:"required,min=9,max=15"`
	DisplayName string `json:"display_name" binding:"required,min=2,max=32"`
	Password    string `json:"password" binding:"required,min=6,max=32"`
}

func (s *securityService) register(c *gin.Context) {
	body := registerRequest{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: err.Error(),
		})
		return
	}

	// Check if phone number already registered
	existingUser, _ := s.userRepo.FindByPhone(body.Phone)
	if existingUser != nil && existingUser.ID > 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: "Số điện thoại đã được đăng ký trên hệ thống",
		})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Message: "Lỗi mã hóa mật khẩu",
		})
		return
	}

	user := domain.User{
		Phone:        body.Phone,
		DisplayName:  body.DisplayName,
		HashPassword: string(hashPassword),
	}

	err = s.userRepo.Save(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Message: "Không thể lưu thông tin tài khoản",
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: user})
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
