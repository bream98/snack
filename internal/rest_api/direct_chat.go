package rest_api

import (
	"net/http"
	"snack/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DirectChatService struct {
	directChannelRepo *repo.DirectChannelRepo
}

func (d *DirectChatService) GetDirectChannels(c *gin.Context) {
	userId := c.GetUint("userId")

	channels, err := d.directChannelRepo.GetDirectChannelByUserId(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Data: channels})
}

func (d *DirectChatService) GetDirectMessages(c *gin.Context) {
	userId := c.GetUint("userId")
	if userId == 0 {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Unauthorized"})
		return
	}

	channelIdStr := c.Param("channelId")
	fromMsgIdStr := c.Query("from_msg_id")

	channelId, err := strconv.ParseUint(channelIdStr, 10, 64)
	if err != nil || channelId == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{Message: "channel_id không hợp lệ"})
		return
	}

	var pFromMsgId *uint
	if fromMsgIdStr != "" {
		val, err := strconv.ParseUint(fromMsgIdStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{Message: "from_msg_id không hợp lệ"})
			return
		}
		uVal := uint(val)
		pFromMsgId = &uVal
	}

	messages, err := d.directChannelRepo.GetDirectMessages(userId, uint(channelId), pFromMsgId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{Data: messages})
}
