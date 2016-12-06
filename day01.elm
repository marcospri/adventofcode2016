module Main exposing (..)

import Debug
import Regex
import Set
import Array
import Html exposing (program, text, textarea, div, button, pre)
import View exposing (renderProblem)
import Inputs exposing (problemInputs)


main : Program Never Model Msg
main =
    program { init = init, view = view, update = update, subscriptions = subscriptions }


type alias Model =
    { problemDay : Int
    , input : String
    , solutionPart1 : String
    , solutionPart2 : String
    , direction : ( Int, Int )
    , position : ( Int, Int )
    }


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
                        |> toString
            in
                ( { model | solutionPart1 = solution }, Cmd.none )

        Solve2 ->
            let
                solution =
                    solverPart2 model
                        |> toString
            in
                ( { model | solutionPart2 = solution }, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


init : ( Model, Cmd msg )
init =
    ( { problemDay = 1
      , input = Array.get 0 problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , direction = ( 0, 1 )
      , position = ( 0, 0 )
      }
    , Cmd.none
    )


turn : String -> Model -> Model
turn direction model =
    let
        ( dirX, dirY ) =
            model.direction
    in
        case direction of
            "R" ->
                { model | direction = ( dirY, -dirX ) }

            "L" ->
                { model | direction = ( -dirY, dirX ) }

            _ ->
                Debug.crash "Unknown direction"


advance : Int -> Model -> Model
advance distance model =
    let
        ( dirX, dirY ) =
            model.direction

        ( posX, posY ) =
            model.position
    in
        { model
            | position =
                ( (distance * dirX) + posX
                , (distance * dirY) + posY
                )
        }


blockDistance : ( Int, Int ) -> Int
blockDistance ( x, y ) =
    x + y


getMovements : Model -> List ( String, Int )
getMovements model =
    model.input
        |> String.split ","
        |> List.map String.trim
        |> List.map (\x -> (Regex.find (Regex.AtMost 2) (Regex.regex "([RL])(\\d+)") x))
        |> List.map
            (\x ->
                case List.head x of
                    Just d ->
                        case d.submatches of
                            [ dir, dist ] ->
                                ( dir |> Maybe.withDefault "R"
                                , dist
                                    |> Maybe.withDefault "0"
                                    |> String.toInt
                                    |> Result.withDefault 0
                                )

                            _ ->
                                Debug.crash "Input is not correct"

                    Nothing ->
                        Debug.crash "Input is not correct"
            )


solverPart1 : Model -> Int
solverPart1 model =
    (getMovements model)
        |> List.foldl
            (\( direction, distance ) m ->
                m |> turn direction |> advance distance
            )
            model
        |> .position
        |> blockDistance


solverPart2 : Model -> Int
solverPart2 model =
    let
        moves =
            getMovements model
    in
        findDuplicatePosition_ model moves (Set.fromList [])
            |> blockDistance


intermediatePositions : ( Int, Int ) -> ( Int, Int ) -> List ( Int, Int )
intermediatePositions ( x1, y1 ) ( x2, y2 ) =
    if x1 == x2 then
        -- TODO less copy pasta
        if y1 <= y2 then
            List.map ((\x y -> ( x, y )) x1) (List.range y1 y2)
        else
            List.map ((\x y -> ( x, y )) x1) (List.range y2 y1)
                |> List.reverse
    else if x1 <= x2 then
        List.map ((\y x -> ( x, y )) y1) (List.range x1 x2)
    else
        List.map ((\y x -> ( x, y )) y1) (List.range x2 x1)
            |> List.reverse


type AlreadyVisited
    = NotVisited (Set.Set ( Int, Int ))
    | Visited ( Int, Int )


checkVisited : List ( Int, Int ) -> Set.Set ( Int, Int ) -> AlreadyVisited
checkVisited newPositions positions =
    case newPositions of
        [] ->
            NotVisited positions

        h :: t ->
            case (Set.member h positions) of
                True ->
                    Visited h

                False ->
                    checkVisited t (Set.insert h positions)


findDuplicatePosition_ : Model -> List ( String, Int ) -> Set.Set ( Int, Int ) -> ( Int, Int )
findDuplicatePosition_ model movements positions =
    case movements of
        [] ->
            Debug.crash "No solution, no duplicate movements"

        h :: t ->
            let
                ( direction, distance ) =
                    h

                updatedModel =
                    (model |> turn direction |> advance distance)

                intermediates =
                    (intermediatePositions model.position updatedModel.position) |> List.reverse |> List.tail
            in
                case intermediates of
                    Nothing ->
                        Debug.crash "No intermediate positions!!!"

                    Just i ->
                        case checkVisited (List.reverse i) positions of
                            Visited a ->
                                a

                            NotVisited p ->
                                findDuplicatePosition_ updatedModel t p


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
