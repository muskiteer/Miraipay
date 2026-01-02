"""
Google Gemini LLM Integration Service
Handles tool formatting, LLM calls, and response generation
"""

import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.models import Tool
from app.crypto import decrypt_data


def format_tools_for_llm(tools: List[Tool]) -> str:
    """
    Format tools in MCP (Model Context Protocol) style for LLM consumption
    
    Args:
        tools: List of Tool objects from database
        
    Returns:
        JSON string with formatted tool information
    """
    formatted_tools = []
    
    for tool in tools:
        tool_info = {
            "name": tool.name,
            "description": tool.description,
            "url": tool.api_url,
            "method": tool.api_method,
            "price_mnee": tool.price_mnee,
            "tool_id": tool.id,
            "headers": json.loads(tool.api_headers) if tool.api_headers else {},
            "body_template": json.loads(tool.api_body_template) if tool.api_body_template else {}
        }
        formatted_tools.append(tool_info)
    
    return json.dumps(formatted_tools, indent=2)


def create_tool_selection_prompt(user_message: str, tools_json: str) -> str:
    """
    Create a system prompt for tool selection
    
    Args:
        user_message: The user's query
        tools_json: JSON string of available tools
        
    Returns:
        Complete prompt for LLM
    """
    return f"""You are an AI agent with access to various tools. Your job is to select the most appropriate tool to help answer the user's request.

Available Tools:
{tools_json}

User Request: {user_message}

Analyze the user's request and select the most appropriate tool. Respond ONLY with a JSON object in this exact format:
{{
    "tool_id": <selected_tool_id>,
    "tool_name": "<selected_tool_name>",
    "reasoning": "<brief explanation of why this tool was selected>",
    "parameters": {{<any parameters needed for the tool>}}
}}

If no tool is appropriate, respond with:
{{
    "tool_id": null,
    "tool_name": null,
    "reasoning": "<explanation of why no tool fits>",
    "parameters": {{}}
}}"""


def call_gemini_for_tool_selection(
    user_message: str,
    tools_json: str,
    encrypted_api_key: str,
    encryption_key: bytes,
    model: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Call Google Gemini LLM to select appropriate tool
    
    Args:
        user_message: User's query
        tools_json: Formatted tools JSON string
        encrypted_api_key: User's encrypted Gemini API key
        encryption_key: Encryption key for decryption
        model: Gemini model to use
        
    Returns:
        Dict with tool selection info: {tool_id, tool_name, reasoning, parameters}
    """
    try:
        # Decrypt API key
        api_key = decrypt_data(encrypted_api_key, encryption_key)
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create prompt
        prompt = create_tool_selection_prompt(user_message, tools_json)
        
        # Initialize model
        gemini_model = genai.GenerativeModel(
            model_name=model,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 500,
            }
        )
        
        # Call Gemini
        full_prompt = "You are a helpful AI assistant that selects the best tool for user requests.\n\n" + prompt
        response = gemini_model.generate_content(full_prompt)
        
        # Parse response
        response_text = response.text
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        selection = json.loads(response_text)
        return selection
        
    except json.JSONDecodeError as e:
        return {
            "tool_id": None,
            "tool_name": None,
            "reasoning": f"Failed to parse LLM response: {str(e)}",
            "parameters": {},
            "error": "json_decode_error"
        }
    except Exception as e:
        return {
            "tool_id": None,
            "tool_name": None,
            "reasoning": f"Error calling Groq: {str(e)}",
            "parameters": {},
            "error": "gemini_api_error"
        }


def generate_final_response(
    user_message: str,
    tool_name: Optional[str],
    tool_result: Optional[Dict[str, Any]],
    encrypted_api_key: str,
    encryption_key: bytes,
    error_message: Optional[str] = None,
    model: str = "gemini-2.5-flash"
) -> str:
    """
    Generate final natural language response based on tool execution
    
    Args:
        user_message: Original user query
        tool_name: Name of tool that was used
        tool_result: Result from tool execution
        encrypted_api_key: User's encrypted Gemini API key
        encryption_key: Encryption key for decryption
        error_message: Optional error message if tool failed
        model: Gemini model to use
        
    Returns:
        Natural language response string
    """
    try:
        # Decrypt API key
        api_key = decrypt_data(encrypted_api_key, encryption_key)
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create context prompt
        if error_message:
            context = f"""The user asked: "{user_message}"

We attempted to use the tool "{tool_name}" but encountered an error: {error_message}

Please apologize to the user and explain what went wrong in a friendly, helpful manner."""
        elif tool_result:
            context = f"""The user asked: "{user_message}"

We used the tool "{tool_name}" and got this result:
{json.dumps(tool_result, indent=2)}

IMPORTANT: When summarizing prices or payments:
- ALWAYS mention the MNEE token payment if this was a paid tool
- Show booking IDs, confirmation numbers, and reference codes prominently
- If there's a QR code or confirmation link, mention it
- Focus on the key details like seats, times, locations
- Keep USD prices secondary or omit them if MNEE amount is shown

Please summarize this result in a natural, conversational way that directly answers the user's question and highlights the successful transaction."""
        else:
            context = f"""The user asked: "{user_message}"

Unfortunately, we don't have an appropriate tool to handle this request.

Please politely inform the user that we cannot help with this specific request at the moment, and suggest they try a different query."""
        
        # Initialize model
        gemini_model = genai.GenerativeModel(
            model_name=model,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1000,
            }
        )
        
        # Call Gemini for final response
        full_prompt = "You are a helpful AI assistant. Provide clear, concise, and friendly responses.\n\n" + context
        response = gemini_model.generate_content(full_prompt)
        
        return response.text
        
    except Exception as e:
        # Fallback response if LLM fails
        if error_message:
            return f"I apologize, but I encountered an error while trying to help: {error_message}"
        elif tool_result:
            return f"I found this information for you: {json.dumps(tool_result)}"
        else:
            return "I apologize, but I'm unable to help with that request at the moment."


def validate_gemini_api_key(api_key: str) -> tuple[bool, str]:
    """
    Validate a Google Gemini API key by making a test call
    
    Args:
        api_key: The Gemini API key to validate
        
    Returns:
        Tuple of (is_valid, message)
    """
    try:
        genai.configure(api_key=api_key)
        
        # Initialize model
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Make a simple test call
        response = model.generate_content("Say 'OK' if you can read this.")
        
        return True, "API key is valid"
        
    except Exception as e:
        return False, f"Invalid API key: {str(e)}"
