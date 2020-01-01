<?php
class A {
    public function b($c, $d, $e) {
        return new $c($d, ...$e);
    }
}
