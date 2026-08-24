package message

import (
	"errors"
	"os"
	"snack/internal/rest_api"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func CheckToken(c *gin.Context) (*rest_api.AuthClaims, error) {
	var tokenString string

	// 1. Try reading token from WebSocket Subprotocol header (Sec-WebSocket-Protocol)
	// Browser sends: Sec-WebSocket-Protocol: access_token, <jwt_token>
	subprotocol := c.Request.Header.Get("Sec-WebSocket-Protocol")
	if subprotocol != "" {
		parts := strings.Split(subprotocol, ",")
		if len(parts) >= 2 {
			tokenString = strings.TrimSpace(parts[1])
		} else if len(parts) == 1 && !strings.EqualFold(strings.TrimSpace(parts[0]), "access_token") {
			tokenString = strings.TrimSpace(parts[0])
		}
	}

	// 2. Fallback to URL query string ?token=...
	if tokenString == "" {
		tokenString = c.Query("token")
	}

	// 3. Fallback to Authorization header
	if tokenString == "" {
		tokenString = c.Request.Header.Get("Authorization")
	}

	if tokenString == "" {
		return nil, errors.New("missing token")
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	jwtSecret := getEnv("JWT_SECRET", "secret")
	token, err := jwt.ParseWithClaims(
		tokenString,
		&rest_api.AuthClaims{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*rest_api.AuthClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
