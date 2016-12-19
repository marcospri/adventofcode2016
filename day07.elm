module Main exposing (..)

import Array
import Set
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
    7


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


findAbbas : String -> List String
findAbbas string =
    let
        abbas =
            Regex.find Regex.All (Regex.regex "\\w*(\\w)(\\w)\\2\\1\\w*") string
    in
        abbas
            |> List.map .submatches
            |> List.map (List.map (Maybe.withDefault ""))
            |> List.map (String.join "")
            |> List.filter (\x -> x /= String.reverse x)
            |> List.map (\x -> x ++ (x |> String.reverse))


reverseABA : String -> String
reverseABA string =
    case String.split "" string of
        a :: b :: c :: [] ->
            String.concat [ b, a, b ]

        _ ->
            Debug.crash "Invalid ABA!"


findABAs : String -> List String
findABAs string =
    findABAs_ [] string


findABAs_ : List String -> String -> List String
findABAs_ abas string =
    let
        _ =
            string

        tail =
            String.dropLeft 1 string
    in
        case String.split "" string of
            a1 :: b :: a2 :: t ->
                if a1 == a2 && b /= a1 then
                    findABAs_ ((String.concat [ a1, b, a2 ]) :: abas) tail
                else
                    findABAs_ abas tail

            _ ->
                abas


supportsSSL : String -> Bool
supportsSSL string =
    let
        outSideABAS =
            string
                |> String.split "["
                |> List.map (String.split "]")
                |> List.map List.reverse
                |> List.map List.head
                |> List.map (Maybe.withDefault "")
                |> List.map findABAs
                |> List.concat
                |> List.map reverseABA
                |> List.foldr Set.insert Set.empty

        insideABAS =
            Regex.find Regex.All (Regex.regex "\\[(\\w*?)\\]") string
                |> List.map .submatches
                |> List.map (List.map (Maybe.withDefault ""))
                |> List.map (String.join "")
                |> List.map findABAs
                |> List.concat
                |> List.foldr Set.insert Set.empty
    in
        Set.intersect outSideABAS insideABAS
            |> Set.size
            |> (<) 0


hasBracketedAbbas : List String -> String -> Bool
hasBracketedAbbas abbas string =
    let
        bracketedAbbas =
            Regex.find Regex.All (Regex.regex "\\[(\\w*?)\\]") string
                |> List.map .submatches
                |> List.map (List.map (Maybe.withDefault ""))
                |> List.map (String.join "")
                |> List.filter (\x -> (findAbbas x |> List.length) > 0)
    in
        List.length bracketedAbbas > 0


supportsTLS : String -> Bool
supportsTLS string =
    let
        abbas =
            findAbbas string
    in
        case List.length abbas of
            0 ->
                False

            _ ->
                if hasBracketedAbbas abbas string then
                    False
                else
                    True


solverPart1 : Model -> String
solverPart1 model =
    model.input
        |> String.split ("\n")
        |> List.map String.trim
        |> List.filter supportsTLS
        |> List.length
        |> toString


solverPart2 : Model -> String
solverPart2 model =
    model.input
        |> String.split ("\n")
        |> List.map String.trim
        |> List.filter supportsSSL
        |> List.length
        |> toString


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
