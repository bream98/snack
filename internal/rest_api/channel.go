package rest_api

import (
	"net/http"
	"snack/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ChannelService struct {
	ChannelRepo *repo.ChannelRepo
}

type CreateChannelReq struct {
	Name string `json:"name" binding:"required,min=1,max=64"`
}

type MemberReq struct {
	UserId uint `json:"user_id" binding:"required"`
}

func (s *ChannelService) GetByUserId(c *gin.Context) {
	userId := c.GetUint("userId")
	channels, err := s.ChannelRepo.GetByUserId(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: channels})
}

func (s *ChannelService) CreateChannel(c *gin.Context) {
	userId := c.GetUint("userId")
	var req CreateChannelReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}
	ch, err := s.ChannelRepo.Create(req.Name, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, SuccessResponse{Data: ch})
}

func (s *ChannelService) GetChannelById(c *gin.Context) {
	id, err := parseUintParam(c, "channelId")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "channelId không hợp lệ"})
		return
	}
	ch, err := s.ChannelRepo.GetById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Message: "Kênh không tồn tại"})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: ch})
}

func (s *ChannelService) DeleteChannel(c *gin.Context) {
	id, err := parseUintParam(c, "channelId")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "channelId không hợp lệ"})
		return
	}
	if err := s.ChannelRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{})
}

func (s *ChannelService) GetChannelMember(c *gin.Context) {
	id, err := parseUintParam(c, "channelId")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "channelId không hợp lệ"})
		return
	}
	members, err := s.ChannelRepo.GetMembers(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: members})
}

func (s *ChannelService) AddChannelMember(c *gin.Context) {
	channelId, err := parseUintParam(c, "channelId")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "channelId không hợp lệ"})
		return
	}
	var req MemberReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: err.Error()})
		return
	}
	if err := s.ChannelRepo.AddMember(channelId, req.UserId); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{})
}

func (s *ChannelService) RemoveChannelMember(c *gin.Context) {
	channelId, err := parseUintParam(c, "channelId")
	userId, err2 := parseUintParam(c, "targetUserId")
	if err != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "Tham số không hợp lệ"})
		return
	}
	if err := s.ChannelRepo.RemoveMember(channelId, userId); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{})
}

func parseUintParam(c *gin.Context, key string) (uint, error) {
	val, err := strconv.ParseUint(c.Param(key), 10, 64)
	return uint(val), err
}
