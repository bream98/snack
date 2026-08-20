package api

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
	Phone    string `binding:"required,phone"`
	Password string `binding:"required,min=6,max=16"`
}

type loginResponse struct {
	Token string `json:"token"`
	User  *domain.User
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
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: e.Error(),
		})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(body.Password)) != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: "Invalid password",
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

	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(jwtSecret))
	c.JSON(http.StatusOK, SuccessResponse{Data: loginResponse{Token: token, User: user}})
}

type registerRequest struct {
	Phone       string `binding:"required,phone"`
	DisplayName string `binding:"required,min=2,max=16"`
	Password    string `binding:"required,min=6,max=16"`
}

func (s *securityService) register(c *gin.Context) {
	body := registerRequest{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Message: err.Error(),
		})
		return
	}

	hashPassword, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	user := domain.User{
		Phone:        body.Phone,
		DisplayName:  body.DisplayName,
		HashPassword: string(hashPassword),
	}

	err := s.userRepo.Save(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Message: err.Error(),
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
