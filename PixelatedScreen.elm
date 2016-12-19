module PixelatedScreen exposing (..)

{-| PixelatedScreen provides a canvas to draw in a screen with a defined
    `pixel` size that is treated individually.

    The real underlying canvas will be:
         (width x pixelSize) x (height x pixelSize) real pixels.
-}

import Array
import Color
import Collage


type alias ScreenBuffer =
    Array.Array (Array.Array Color.Color)


type alias PixelatedScreen =
    { canvasWidth : Int
    , canvasHeight : Int
    , pixelSize : Int
    , height : Int
    , width : Int
    , buffer : ScreenBuffer
    }


{-| Creates an array of arrays with the color
    information of the PixelatedScreen pixels. All pixels will be initialized to color
-}
buffer : Color.Color -> ( Int, Int ) -> ScreenBuffer
buffer color ( w, h ) =
    (Array.initialize h
        (\_ ->
            Array.initialize w (\_ -> color)
        )
    )


getBufferRow : Int -> ScreenBuffer -> Array.Array Color.Color
getBufferRow y buffer =
    case Array.get y buffer of
        Just n ->
            n

        Nothing ->
            Debug.crash ("Screen out of bounds y: " ++ toString y)


getColorAt : ( Int, Int ) -> ScreenBuffer -> Color.Color
getColorAt ( x, y ) buffer =
    let
        row =
            getBufferRow y buffer
    in
        case Array.get x row of
            Just n ->
                n

            Nothing ->
                Debug.crash ("Screen out of bounds x: " ++ toString x)


setBufferColor : ( Int, Int ) -> Color.Color -> ScreenBuffer -> ScreenBuffer
setBufferColor ( x, y ) color buffer =
    let
        bufferRow =
            (getBufferRow y buffer) |> Array.set x color
    in
        Array.set y bufferRow buffer


moveTo : PixelatedScreen -> Int -> Int -> Collage.Form -> Collage.Form
moveTo screen x y form =
    form
        |> Collage.move (toElmCoordinates ( x, y ) screen)


getFormAt : PixelatedScreen -> ( Int, Int ) -> Collage.Form
getFormAt screen ( x, y ) =
    let
        color =
            getColorAt ( x, y ) screen.buffer
    in
        Collage.square (toFloat (screen.pixelSize))
            |> Collage.filled color
            |> moveTo screen x y


{-| Creates a new screen based on pixel size and the size

    screen 10 (64, 32) Will create a canvas of 640x320 real pixels

    Initializes the buffer to Color
-}
screen : Int -> ( Int, Int ) -> Color.Color -> PixelatedScreen
screen pixelSize ( width, height ) color =
    let
        w =
            pixelSize * width

        h =
            pixelSize * height
    in
        { canvasWidth = w
        , canvasHeight = h
        , pixelSize = pixelSize
        , width = width
        , height = height
        , buffer = buffer color ( width, height )
        }


updateBuffer screen buffer =
    { screen | buffer = buffer }


toCoordinates : PixelatedScreen -> Int -> ( Int, Int )
toCoordinates screen bufferPos =
    ( bufferPos % (screen.canvasWidth // screen.pixelSize)
    , bufferPos // (screen.canvasWidth // screen.pixelSize)
    )


toElmCoordinates : ( Int, Int ) -> PixelatedScreen -> ( Float, Float )
toElmCoordinates ( x, y ) screen =
    let
        xOffset =
            (x * screen.pixelSize) + screen.pixelSize // 2

        yOffset =
            (y * -screen.pixelSize) - screen.pixelSize // 2
    in
        ( (toFloat (screen.canvasWidth) / 2 - toFloat (xOffset)) * -1
        , (toFloat (screen.canvasHeight) / 2 + toFloat (yOffset))
        )



--TODO write function accepting a function ala raytracer


toHtmlForms : PixelatedScreen -> List Collage.Form
toHtmlForms screen =
    List.range 0 (screen.width * screen.height - 1)
        |> List.map (toCoordinates screen)
        |> List.map (getFormAt screen)
