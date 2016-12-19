module Main exposing (..)

import Array
import Regex
import Html exposing (program, text, textarea, div, button, pre)
import View exposing (renderProblem)
import Inputs exposing (problemInputs)


main : Program Never Model Msg
main =
    program { init = init, view = view, update = update, subscriptions = subscriptions }


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


type Msg
    = Solve
    | Solve2


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        Solve ->
            let
                solution =
                    solverPart1 model
            in
                ( { model | solutionPart1 = solution }, Cmd.none )

        Solve2 ->
            let
                solution =
                    solverPart2 model
            in
                ( { model | solutionPart2 = solution }, Cmd.none )


type alias Model =
    { problemDay : Int
    , input : String
    , solutionPart1 : String
    , solutionPart2 : String
    , registers : Array.Array Int
    , pc : Int
    }


problemDay : Int
problemDay =
    12


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , registers = Array.fromList [ 0, 0, 0, 0 ]
      , pc = 0
      }
    , Cmd.none
    )


regNameToIndex : String -> Int
regNameToIndex string =
    case string of
        "a" ->
            0

        "b" ->
            1

        "c" ->
            2

        "d" ->
            3

        _ ->
            Debug.crash ("Invalid register: " ++ string)


getInstructionParamsRegInt : String -> ( Int, Int )
getInstructionParamsRegInt string =
    case Regex.find (Regex.AtMost 1) (Regex.regex "\\w+ ([a-z]) (-?\\d+)") string of
        m :: [] ->
            case m.submatches of
                reg :: int :: [] ->
                    let
                        regValue =
                            reg |> Maybe.withDefault "" |> regNameToIndex

                        intValue =
                            int |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0
                    in
                        ( regValue, intValue )

                _ ->
                    Debug.crash "Invalid RegInt params"

        _ ->
            Debug.crash ("Invalid RegInt params: " ++ string)


getInstructionParamsIntReg : String -> ( Int, Int )
getInstructionParamsIntReg string =
    case Regex.find (Regex.AtMost 1) (Regex.regex "\\w+ (-?\\d+) ([a-z])") string of
        m :: [] ->
            case m.submatches of
                int :: reg :: [] ->
                    let
                        intValue =
                            int |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0

                        regValue =
                            reg |> Maybe.withDefault "" |> regNameToIndex
                    in
                        ( intValue, regValue )

                _ ->
                    Debug.crash ("Invalid IntReg params: " ++ string)

        _ ->
            Debug.crash ("Invalid IntReg params: " ++ string)


getInstructionParamsIntInt : String -> ( Int, Int )
getInstructionParamsIntInt string =
    case Regex.find (Regex.AtMost 1) (Regex.regex "\\w+ (-?\\d+) (-?\\d+)") string of
        m :: [] ->
            case m.submatches of
                int1 :: int2 :: [] ->
                    let
                        intValue =
                            int1 |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0

                        intValue2 =
                            int2 |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0
                    in
                        ( intValue, intValue2 )

                _ ->
                    Debug.crash ("Invalid IntInt params: " ++ string)

        _ ->
            Debug.crash ("Invalid IntInt params: " ++ string)


getInstructionParamsRegReg : String -> ( Int, Int )
getInstructionParamsRegReg string =
    case Regex.find (Regex.AtMost 1) (Regex.regex "\\w+ ([a-z]) ([a-z])") string of
        m :: [] ->
            case m.submatches of
                i1 :: i2 :: [] ->
                    let
                        regValue1 =
                            i1 |> Maybe.withDefault "" |> regNameToIndex

                        regValue2 =
                            i2 |> Maybe.withDefault "" |> regNameToIndex
                    in
                        ( regValue1, regValue2 )

                _ ->
                    Debug.crash "Invalid RegReg params"

        _ ->
            Debug.crash ("Invalid RegReg params: " ++ string)


getInstructionParamReg : String -> Int
getInstructionParamReg string =
    case Regex.find (Regex.AtMost 1) (Regex.regex "\\w+ ([a-z])") string of
        m :: [] ->
            case m.submatches of
                i :: [] ->
                    i |> Maybe.withDefault "" |> regNameToIndex

                _ ->
                    Debug.crash "Invalid Reg params"

        _ ->
            Debug.crash ("Invalid Reg param: " ++ string)


type Instruction
    = COPY ( Int, Int )
    | COPYREG ( Int, Int )
    | INC Int
    | DEC Int
    | JNZ ( Int, Int )
    | JNZREG ( Int, Int )


parseInstruction : String -> Instruction
parseInstruction string =
    if String.contains "cpy" string then
        if (Regex.contains (Regex.regex "cpy [a-z] [a-z]") string) then
            COPYREG (getInstructionParamsRegReg string)
        else
            COPY (getInstructionParamsIntReg string)
    else if String.contains "inc" string then
        INC (getInstructionParamReg string)
    else if String.contains "dec" string then
        DEC (getInstructionParamReg string)
    else if String.contains "jnz" string then
        if (Regex.contains (Regex.regex "jnz [a-z] (-?\\d+)") string) then
            JNZREG (getInstructionParamsRegInt string)
        else
            JNZ (getInstructionParamsIntInt string)
    else
        Debug.crash "Unknown instruction"


setRegister : Int -> Int -> Model -> Model
setRegister register value model =
    let
        registers =
            Array.set register value model.registers
    in
        { model | registers = registers }


getRegister : Int -> Model -> Int
getRegister register model =
    case Array.get register model.registers of
        Nothing ->
            Debug.crash "Unknown register"

        Just value ->
            value


incPC : Model -> Model
incPC model =
    { model | pc = model.pc + 1 }


executeProgram : Array.Array Instruction -> Model -> Model
executeProgram program model =
    case Array.get model.pc program of
        Nothing ->
            model

        Just i ->
            let
                newModel =
                    executeInstruction i model
            in
                executeProgram program newModel


executeInstruction : Instruction -> Model -> Model
executeInstruction instruction model =
    case instruction of
        COPY ( value, reg ) ->
            model
                |> setRegister reg value
                |> incPC

        COPYREG ( origin, dest ) ->
            let
                regValue =
                    getRegister origin model
            in
                model
                    |> setRegister dest regValue
                    |> incPC

        INC reg ->
            let
                regValue =
                    getRegister reg model
            in
                model
                    |> setRegister reg (regValue + 1)
                    |> incPC

        DEC reg ->
            let
                regValue =
                    getRegister reg model
            in
                model
                    |> setRegister reg (regValue - 1)
                    |> incPC

        JNZ ( value, jump ) ->
            if value == 0 then
                model |> incPC
            else
                { model | pc = model.pc + jump }

        JNZREG ( reg, jump ) ->
            let
                value =
                    getRegister reg model
            in
                if value == 0 then
                    model |> incPC
                else
                    { model | pc = model.pc + jump }


solverPart1 : Model -> String
solverPart1 model =
    let
        program =
            model.input
                |> String.split ("\n")
                |> List.map String.trim
                |> List.map parseInstruction
                |> Array.fromList
    in
        (executeProgram program model).registers
            |> Array.get 0
            |> toString


solverPart2 : Model -> String
solverPart2 model =
    let
        program =
            model.input
                |> String.split ("\n")
                |> List.map String.trim
                |> List.map parseInstruction
                |> Array.fromList

        initializedModel =
            { model | registers = Array.fromList [ 0, 0, 1, 0 ] }
    in
        (executeProgram program initializedModel).registers
            |> Array.get 0
            |> toString


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        , div [] [ text (toString model.registers) ]
        ]
