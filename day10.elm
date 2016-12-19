module Main exposing (..)

import Array
import Regex
import Dict
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
    , bots : Dict.Dict Int Robot
    , output : Dict.Dict Int Int
    , foundBot : Int
    }


problemDay : Int
problemDay =
    10


init : ( Model, Cmd msg )
init =
    ( { problemDay =
            problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , bots = Dict.empty
      , output = Dict.empty
      , foundBot = 0
      }
    , Cmd.none
    )


type alias Robot =
    { number : Int
    , payload : ( Maybe Int, Maybe Int )
    , ordersHigh : ( OutputType, Int )
    , ordersLow : ( OutputType, Int )
    }


type OutputType
    = Bot
    | Output


toOutput : String -> OutputType
toOutput output =
    if output == "bot" then
        Bot
    else
        Output


parseValue : String -> Instruction
parseValue string =
    let
        match =
            Regex.find (Regex.AtMost 1) (Regex.regex "value (\\d+) goes to bot (\\d+)") string
    in
        case match of
            m :: [] ->
                m.submatches
                    |> List.map (Maybe.withDefault "")
                    |> List.map (String.toInt)
                    |> List.map (Result.withDefault 0)
                    |> (\l ->
                            case l of
                                value :: bot :: [] ->
                                    Value ( value, bot )

                                _ ->
                                    Debug.crash "Invalid input"
                       )

            _ ->
                Debug.crash "Invalid input"


parseMovement : String -> Instruction
parseMovement string =
    let
        match =
            Regex.find (Regex.AtMost 1) (Regex.regex "bot (\\d+) gives low to (bot|output) (\\d+) and high to (bot|output) (\\d+)") string
    in
        case match of
            m :: [] ->
                m.submatches
                    |> List.map (Maybe.withDefault "")
                    |> (\l ->
                            case l of
                                bot :: lowTo :: lowToNum :: highTo :: highToNum :: [] ->
                                    let
                                        botNumber =
                                            bot |> String.toInt |> Result.withDefault 0

                                        lowToType =
                                            toOutput lowTo

                                        lowToNumber =
                                            lowToNum |> String.toInt |> Result.withDefault 0

                                        highToType =
                                            toOutput highTo

                                        highToNumber =
                                            highToNum |> String.toInt |> Result.withDefault 0
                                    in
                                        Movement ( botNumber, lowToType, lowToNumber, highToType, highToNumber )

                                _ ->
                                    Debug.crash ("Invalid input" ++ toString l)
                       )

            _ ->
                Debug.crash ("Invalid input" ++ string)


type Instruction
    = Value ( Int, Int )
    | Movement ( Int, OutputType, Int, OutputType, Int )


updateBotPayload : Int -> Maybe Robot -> Int -> ( Int, Robot )
updateBotPayload botNumber maybeRobot value =
    case maybeRobot of
        Nothing ->
            ( -1
            , { number = botNumber
              , payload = ( Just value, Nothing )
              , ordersLow = ( Bot, 0 )
              , ordersHigh = ( Bot, 0 )
              }
            )

        Just robot ->
            case robot.payload of
                ( Nothing, Nothing ) ->
                    ( -1, { robot | payload = ( Just value, Nothing ) } )

                ( Just v, Nothing ) ->
                    let
                        foundBot =
                            if v == 61 && value == 17 then
                                robot.number
                            else
                                -1
                    in
                        if v > value then
                            ( foundBot, { robot | payload = ( Just v, Just value ) } )
                        else
                            ( foundBot, { robot | payload = ( Just value, Just v ) } )

                _ ->
                    Debug.crash "Overloading bot!!"


updateBotOrders botNumber maybeRobot ( _, lowTo, lowToNumber, highTo, highToNumber ) =
    let
        ordersLow =
            ( lowTo, lowToNumber )

        ordersHigh =
            ( highTo, highToNumber )
    in
        case maybeRobot of
            Nothing ->
                { number = botNumber
                , payload = ( Nothing, Nothing )
                , ordersLow = ordersLow
                , ordersHigh = ordersHigh
                }

            Just robot ->
                { robot | ordersLow = ordersLow, ordersHigh = ordersHigh }


updateFoundBot : Int -> Model -> Model
updateFoundBot foundBot model =
    if foundBot >= 0 then
        { model | foundBot = foundBot }
    else
        model


executeInstruction : Model -> Instruction -> Model
executeInstruction model instruction =
    case instruction of
        Value ( value, bot ) ->
            let
                existingBot =
                    Dict.get bot model.bots

                ( foundBot, updatedBot ) =
                    updateBotPayload bot existingBot value
            in
                { model | bots = Dict.insert bot updatedBot model.bots }
                    |> updateFoundBot foundBot

        Movement orders ->
            let
                ( bot, _, _, _, _ ) =
                    orders

                existingBot =
                    Dict.get bot model.bots
            in
                { model | bots = Dict.insert bot (updateBotOrders bot existingBot orders) model.bots }


executeHightOrder : Robot -> Model -> Model
executeHightOrder robot model =
    let
        ( high, _ ) =
            robot.payload

        hValue =
            high |> Maybe.withDefault 0
    in
        case robot.ordersHigh of
            ( Bot, bot ) ->
                let
                    existingBot =
                        Dict.get bot model.bots

                    ( foundBot, updatedBot ) =
                        updateBotPayload bot existingBot hValue
                in
                    { model | bots = Dict.insert bot updatedBot model.bots }
                        |> updateFoundBot foundBot

            ( Output, v ) ->
                { model | output = Dict.insert v hValue model.output }


executeLowOrder : Robot -> Model -> Model
executeLowOrder robot model =
    let
        ( _, low ) =
            robot.payload

        lValue =
            low |> Maybe.withDefault 0
    in
        case robot.ordersLow of
            ( Bot, bot ) ->
                let
                    existingBot =
                        Dict.get bot model.bots

                    ( foundBot, updatedBot ) =
                        updateBotPayload bot existingBot lValue
                in
                    { model | bots = Dict.insert bot updatedBot model.bots }
                        |> updateFoundBot foundBot

            ( Output, v ) ->
                { model | output = Dict.insert v lValue model.output }


emptyPayload : Robot -> Robot
emptyPayload robot =
    { robot | payload = ( Nothing, Nothing ) }


parseInput : String -> Instruction
parseInput string =
    if String.contains "value" string then
        parseValue string
    else
        parseMovement string


runRobot : Int -> Robot -> Model -> Model
runRobot robotNumber robot model =
    let
        executedInstructions =
            model
                |> executeLowOrder robot
                |> executeHightOrder robot
    in
        { executedInstructions | bots = Dict.insert robotNumber (emptyPayload robot) executedInstructions.bots }


runSimulation : Model -> Model
runSimulation model =
    let
        nextRobot =
            model.bots
                |> Dict.toList
                |> List.filter
                    (\( botNumber, robot ) ->
                        case robot.payload of
                            ( Just h, Just l ) ->
                                True

                            _ ->
                                False
                    )
                |> List.head
    in
        case nextRobot of
            Nothing ->
                model

            Just ( k, robot ) ->
                runSimulation (runRobot k robot model)


solverPart1 : Model -> String
solverPart1 model =
    let
        settedUpRobots =
            model.input
                |> String.split ("\n")
                |> List.map String.trim
                |> List.map parseInput
                |> (List.foldl (\i m -> executeInstruction m i) model)
    in
        (runSimulation settedUpRobots).foundBot
            |> toString


solverPart2 : Model -> String
solverPart2 model =
    let
        settedUpRobots =
            model.input
                |> String.split ("\n")
                |> List.map String.trim
                |> List.map parseInput
                |> (List.foldl (\i m -> executeInstruction m i) model)
    in
        (runSimulation settedUpRobots).output
            |> Dict.filter (\k _ -> k == 0 || k == 1 || k == 2)
            |> Dict.values
            |> List.product
            |> toString


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
