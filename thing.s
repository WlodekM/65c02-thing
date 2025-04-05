ACIA_DATA	= $5000
ACIA_STATUS	= $5001
ACIA_CMD	= $5002
ACIA_CTRL	= $5003

_start:
  jmp printChar
  brk

CHROUT:
                pha
                sta     ACIA_DATA
;                 lda     #$FF
; .txdelay:       dec
;                 bne    .txdelay
                pla
                rts

fallback:
  lda #$21
  brk
printChar:
  jmp print
fallback2:
  lda #$22
  brk
print:
  lda #$64
  jsr CHROUT
  lda #$20
  pha
  BRK