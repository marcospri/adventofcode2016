module Main exposing (..)

import Array
import Regex
import Color
import Collage
import Element
import Html exposing (program, text, textarea, div, button, pre)
import Html.Attributes exposing (class)
import View exposing (renderProblem)
import Inputs exposing (problemInputs)
import PixelatedScreen


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
                newModel =
                    solverPart1 model

                solution =
                    newModel.screen.buffer
                        |> Array.map Array.toList
                        |> Array.toList
                        |> List.concat
                        |> List.filter (\c -> c == screenOnColor)
                        |> List.length
                        |> toString
            in
                ( { newModel | solutionPart1 = solution }, Cmd.none )

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
    , screen : PixelatedScreen.PixelatedScreen
    }


screenOffColor : Color.Color
screenOffColor =
    (Color.rgb 15 15 35)


screenOnColor : Color.Color
screenOnColor =
    (Color.rgb 0 153 0)


problemDay : Int
problemDay =
    8


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , screen = PixelatedScreen.screen 20 ( 50, 6 ) screenOffColor
      }
    , Cmd.none
    )


type Instruction
    = Rect ( Int, Int )
    | RRow ( Int, Int )
    | RColumn ( Int, Int )


parseRect : String -> Instruction
parseRect string =
    let
        matches =
            Regex.find (Regex.AtMost 1) (Regex.regex "rect (\\d+)x(\\d+)") string
    in
        matches
            |> List.map .submatches
            |> List.concat
            |> List.map (Maybe.withDefault "")
            |> (\l ->
                    case l of
                        x :: y :: [] ->
                            Rect
                                ( String.toInt x |> Result.withDefault 0
                                , String.toInt y |> Result.withDefault 0
                                )

                        _ ->
                            Debug.crash "Malformed rect intruction"
               )


parseRotate : String -> ( Int, Int )
parseRotate string =
    let
        match =
            Regex.find (Regex.AtMost 1) (Regex.regex "rotate (column|row) (x|y)=(\\d+) by (\\d+)") string
    in
        match
            |> List.map .submatches
            |> List.concat
            |> (\l ->
                    case l of
                        _ :: _ :: x :: y :: [] ->
                            ( x
                                |> Maybe.withDefault ""
                                |> String.toInt
                                |> Result.withDefault 0
                            , y
                                |> Maybe.withDefault ""
                                |> String.toInt
                                |> Result.withDefault 0
                            )

                        _ ->
                            Debug.crash "Malformed rotate intruction"
               )


parseInstruction : String -> Instruction
parseInstruction string =
    if String.contains "rect" string then
        parseRect string
    else if String.contains "row" string then
        RRow (parseRotate string)
    else if String.contains "column" string then
        RColumn (parseRotate string)
    else
        Debug.crash "Unexpected input"


litPoint : Color.Color -> ( Int, Int ) -> PixelatedScreen.PixelatedScreen -> PixelatedScreen.PixelatedScreen
litPoint color point screen =
    { screen
        | buffer = PixelatedScreen.setBufferColor point color screen.buffer
    }


litPoints : List ( Int, Int ) -> Model -> Model
litPoints points model =
    let
        screen =
            List.foldl (litPoint screenOnColor) model.screen points
    in
        { model | screen = screen }


litPointsWith : List ( ( Int, Int ), Color.Color ) -> Model -> Model
litPointsWith points model =
    let
        screen =
            List.foldl
                (\( point, color ) s ->
                    litPoint color point s
                )
                model.screen
                points
    in
        { model | screen = screen }


executeInstruction : Instruction -> Model -> Model
executeInstruction instruction model =
    case instruction of
        Rect ( x, y ) ->
            let
                points =
                    List.range 0 (x - 1)
                        |> List.map
                            (\px ->
                                List.range 0 (y - 1)
                                    |> List.map (\py -> ( px, py ))
                            )
                        |> List.concat
            in
                litPoints points model

        RColumn ( col, by ) ->
            let
                points =
                    List.range 0 (model.screen.height - 1)
                        |> List.map
                            (\y ->
                                ( col, y )
                            )
                        |> List.map
                            (\( x, y ) ->
                                let
                                    newColor =
                                        PixelatedScreen.getColorAt ( x, (y - by) % model.screen.height ) model.screen.buffer
                                in
                                    ( ( x, y ), newColor )
                            )
            in
                litPointsWith points model

        RRow ( row, by ) ->
            let
                points =
                    List.range 0 (model.screen.width - 1)
                        |> List.map
                            (\x ->
                                ( x, row )
                            )
                        |> List.map
                            (\( x, y ) ->
                                let
                                    newColor =
                                        PixelatedScreen.getColorAt
                                            ( (x - by) % model.screen.width
                                            , y
                                            )
                                            model.screen.buffer
                                in
                                    ( ( x, y ), newColor )
                            )
            in
                litPointsWith points model


solverPart1 : Model -> Model
solverPart1 model =
    let
        instructions =
            model.input
                |> String.split ("\n")
                |> List.map String.trim
                |> List.map parseInstruction
    in
        List.foldl executeInstruction model instructions


solverPart2 : Model -> String
solverPart2 model =
    "Solve part 1 and read the screen!"


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        , div [ class "panel panel-defaul" ]
            [ div [ class "panel-heading" ] [ text "Screen" ]
            , div [ class "panel-body" ]
                [ div [] [ Collage.collage model.screen.canvasWidth model.screen.canvasHeight (PixelatedScreen.toHtmlForms model.screen) |> Element.toHtml ]
                ]
            ]
        ]
