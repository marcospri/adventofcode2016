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
    }


problemDay : Int
problemDay =
    9


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


type alias CompressSequence =
    { length : Int
    , times : Int
    }


matchToSequence : Regex.Match -> CompressSequence
matchToSequence regexMatch =
    case regexMatch.submatches of
        length :: times :: [] ->
            { length = length |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0
            , times = times |> Maybe.withDefault "" |> String.toInt |> Result.withDefault 0
            }

        _ ->
            Debug.crash "Invalid sequence"


uncompressSequence : CompressSequence -> String -> String
uncompressSequence sequence string =
    let
        subString =
            string
                |> String.slice 0 sequence.length
    in
        String.repeat sequence.times subString


uncompress : Bool -> String -> String
uncompress version2 string =
    let
        matches =
            Regex.find (Regex.AtMost 1) (Regex.regex "\\((\\d+)x(\\d+)\\)") string
    in
        case matches of
            [] ->
                string

            match :: [] ->
                let
                    sequence =
                        matchToSequence match

                    preSequence =
                        String.slice 0 match.index string

                    compressed =
                        String.dropLeft (match.index + (String.length match.match)) string

                    afterSequence =
                        String.dropLeft (match.index + (String.length match.match) + sequence.length) string

                    uncompressed =
                        uncompressSequence sequence compressed
                in
                    if version2 then
                        (uncompress version2 (preSequence ++ uncompressed ++ afterSequence))
                    else
                        preSequence ++ uncompressed ++ (uncompress version2 afterSequence)

            _ ->
                Debug.crash "Invalid sequence"


uncompress2 : Int -> String -> Int
uncompress2 length string =
    let
        matches =
            Regex.find (Regex.AtMost 1) (Regex.regex "\\((\\d+)x(\\d+)\\)") string
    in
        case matches of
            [] ->
                String.length string

            match :: [] ->
                let
                    sequence =
                        matchToSequence match

                    preSequence =
                        String.slice 0 match.index string

                    matchEnd =
                        (match.index + (String.length match.match))

                    compressed =
                        String.slice matchEnd (matchEnd + sequence.length) string

                    afterSequence =
                        String.dropLeft (matchEnd + sequence.length) string
                in
                    length
                        + (String.length preSequence)
                        + (sequence.times * uncompress2 0 compressed)
                        + (uncompress2 0 afterSequence)

            _ ->
                Debug.crash "Invalid sequence"


solverPart1 : Model -> String
solverPart1 model =
    model.input
        |> Regex.replace (Regex.All) (Regex.regex "\\s") (\_ -> "")
        |> uncompress False
        |> String.length
        |> toString


solverPart2 : Model -> String
solverPart2 model =
    model.input
        |> Regex.replace (Regex.All) (Regex.regex "\\s") (\_ -> "")
        |> uncompress2 0
        |> toString


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
