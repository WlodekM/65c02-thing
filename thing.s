ACIA_DATA	= $5000
ACIA_STATUS	= $5001
ACIA_CMD	= $5002
ACIA_CTRL	= $5003

_start:
  lda #$64
  jsr CHROUT
  lda #$20
  pha
  BRK

CHROUT:
                pha
                sta     ACIA_DATA
;                 lda     #$FF
; .txdelay:       dec
;                 bne    .txdelay
                pla
                rts