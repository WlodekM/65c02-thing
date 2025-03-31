// comments exist
// 
// types (in addresses (they store 2 bytes if you forgot)):
// int - 1
// char - 1
// bool - 1
// uuh yeah,, theyre all 1 address ;-;
//
// $VARNAME is the address of the var, when used in mov it means that we get that var
// [$VARNAME] is the address of the var, but when it's used in mov it means we set to the address

// translates to:
// mov a 0
// mov $counter a
// prob not gonna make it do assembly tho
int[4] buff = 0
int counter = 0

fn _start {
    // translates to
    // <inner code>
    // mov a $counter
    // mov b 4
    // cmp a b
    // jz $start_of_inner_code
    while (counter < 4) {
        // translates to
        // mov a [$buff]
        // mov b [$counter]
        // add a a b
        // mov b $counter
        // str a b
        buff[counter] = counter
        // translates to
        // mov a $counter ; further translates to:
        //                ; mov a $counter
        //                ; ld a a
        // mov b 1
        // add a a b
        // str $counter a
        counter = counter + 1
    }
}