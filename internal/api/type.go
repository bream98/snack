package api

import "github.com/golang-jwt/jwt/v5"

type ErrorResponse struct {
	Message interface{} `json:"message"`
}

type SuccessResponse struct {
	Data interface{} `json:"data"`
}

type AuthClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}
