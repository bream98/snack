package api

import (
	"net/http"
	"snack/internal/repo"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func Register(r *gin.Engine, db *gorm.DB) {
	userRepo := &repo.UserRepo{Db: db}
	security := securityService{userRepo: userRepo}
	r.POST("/login", security.login)
	r.POST("/register", security.register)
	r.GET("/me")
	r.PUT("/me")
}

func checkAuth() gin.HandlerFunc {
	return func(context *gin.Context) {
		// before request
		tokenString := context.GetHeader("Authorization")
		jwtSecret := getEnv("JWT_SECRET", "secret")
		token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil {
			context.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Message: "Unauthorized"})
			return
		} else if claims, ok := token.Claims.(*AuthClaims); ok && !token.Valid {
			context.Set("userId", claims.UserID)
		} else {
			context.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Message: "Unauthorized"})
			return
		}
		context.Next()
	}
}
