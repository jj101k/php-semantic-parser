# php-semantic-parser

Parse PHP scripts to discover unannotated behaviours

## Description

The rationale here is that extracting the semantics requires walking the file -
and only once - to build a semantic tree rather than an AST, and while
separately building an AST then trying to walk it is possible it means
everything is considered twice and improvements/optimisations to the parsing for
the use-case are unnecessarily difficult.

Specifically, this wants to produce a tree where everything has a type, even if
that type is "mixed", "not defined" is distinguished from "null", and it becomes
possible to tell the developer when they may not be using the value they think
they are using.

This should have an interest in files outside the set being considered, but only
to the extent needed to determine public method arg/return types and public
property/class var/constant types - in other words, the stuff needed to
understand programs which are using that code.

This *does not* reproduce the actual PHP (Zend) AST, since that's not documented
well enough for a reliable implementation. Instead, it produces a
reverse-engineered AST based on common usage. As a result, this might fail or
produce the wrong results on code PHP accepts - if that happens, please report a
bug.

This reads the code left-to-right to see what's there; while there are context
changes which affect what's expected next, there isn't a tree in any sense until
an atomic element is complete because, for example, `$x++` is an _increment_
operarion _containing_ `$x`, not the other way around.

## Options

If you set the environment variable "debug", all the tokens found by the lexer
will be dumped.