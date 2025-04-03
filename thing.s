_start:
 lda #$78
 jsr goog
 cmp #$78
 brk
goog:
 lda #$50
 rts