package rest_api

import (
	"net/http"
	"snack/internal/repo"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func Register(r *gin.Engine, db *gorm.DB) {
	// Enable CORS for frontend client
	r.Use(corsMiddleware())

	userRepo := &repo.UserRepo{Db: db}
	security := securityService{userRepo: userRepo}
	userSvc := userService{userRepo: userRepo}
	auth := checkAuth()

	directChatRepo := &repo.DirectChannelRepo{Db: db}
	directChatService := DirectChatService{directChannelRepo: directChatRepo}

	// Public Auth Endpoints
	r.POST("/login", security.login)
	r.POST("/register", security.register)

	// Protected User Endpoints
	r.GET("/me", auth, userSvc.GetMe)
	r.PUT("/me", auth, userSvc.UpdateMe)

	r.GET("/direct-chat", auth, directChatService.GetDirectChannels)
	r.GET("/direct-chat/messages/:channelId", auth, directChatService.GetDirectMessages)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func checkAuth() gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenHeader := context.GetHeader("Authorization")
		if tokenHeader == "" {
			context.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Message: "Thiếu mã xác thực (Authorization header)"})
			return
		}

		// Support "Bearer <token>" or raw token
		tokenString := strings.TrimPrefix(tokenHeader, "Bearer ")
		tokenString = strings.TrimSpace(tokenString)

		jwtSecret := getEnv("JWT_SECRET", "secret")
		token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil {
			context.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Message: "Mã phiên làm việc không hợp lệ hoặc đã hết hạn"})
			return
		}

		claims, ok := token.Claims.(*AuthClaims)
		if ok && token.Valid {
			context.Set("userId", claims.UserID)
			context.Next()
		} else {
			context.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Message: "Phiên đăng nhập không hợp lệ"})
			return
		}
	}
}
